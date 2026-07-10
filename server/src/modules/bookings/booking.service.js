const Booking = require('./booking.model');
const Tool = require('../tools/tool.model');
const Payment = require('../payments/payment.model');
const User = require('../auth/user.model');
const Notification = require('../notifications/notification.model');
const { sendEmail } = require('../../config/email');
const {
  getBookingRequestedTemplate,
  getBookingApprovedTemplate,
  getBookingRejectedTemplate,
  getOverdueReminderTemplate,
} = require('../notifications/email.templates');

// Normalizes dates to set hours to midnight for consistent full-day comparison.
function normalizeDates(start, end) {
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
}

// Checks if there are any approved or active bookings for this tool on overlapping dates.
async function checkDateOverlap(toolId, start, end, excludeBookingId = null) {
  const { startDate, endDate } = normalizeDates(start, end);

  const query = {
    toolId,
    bookingStatus: { $in: ['approved', 'active'] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlap = await Booking.findOne(query);
  return !!overlap;
}

// Helper to safely send email in background without blocking main execution thread.
function triggerEmailInBackground(to, subject, html) {
  sendEmail({ to, subject, html }).catch((err) => {
    console.error(`📧 Background email delivery failed to ${to}:`, err.message);
  });
}

// Creates a booking request. Verifies that the dates do not overlap
// with any existing approved/active bookings and calculates cost.
async function createBooking({ toolId, borrowerId, startDate: rawStart, endDate: rawEnd, returnTime }) {
  const tool = await Tool.findById(toolId).populate('ownerId');
  if (!tool) {
    const error = new Error('Tool not found');
    error.status = 404;
    throw error;
  }

  if (tool.ownerId._id.toString() === borrowerId.toString()) {
    const error = new Error('Lenders cannot book their own tools');
    error.status = 400;
    throw error;
  }

  if (tool.status === 'maintenance') {
    const error = new Error('This tool is currently in maintenance and cannot be booked');
    error.status = 400;
    throw error;
  }

  const { startDate, endDate } = normalizeDates(rawStart, rawEnd);
  
  if (startDate < new Date().setHours(0,0,0,0)) {
    const error = new Error('Booking start date cannot be in the past');
    error.status = 400;
    throw error;
  }

  if (endDate < startDate) {
    const error = new Error('End date must be after the start date');
    error.status = 400;
    throw error;
  }

  // Double check overlap before listing the request
  const hasOverlap = await checkDateOverlap(toolId, startDate, endDate);
  if (hasOverlap) {
    const error = new Error('The selected dates overlap with an existing approved rental');
    error.status = 400;
    throw error;
  }

  // Calculate rental duration
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const amount = diffDays * tool.rentPerDay;

  const booking = await Booking.create({
    toolId,
    borrowerId,
    ownerId: tool.ownerId._id,
    startDate,
    endDate,
    amount,
    deposit: tool.depositAmount,
    bookingStatus: 'requested',
    returnTime: returnTime || '18:00',
  });

  const borrower = await User.findById(borrowerId);

  // 1. In-App Notification to Owner
  if (borrower) {
    await Notification.create({
      recipientId: tool.ownerId._id,
      senderId: borrowerId,
      bookingId: booking._id,
      type: 'request',
      title: 'New Rental Request Received',
      message: `${borrower.fullName} requested to book "${tool.name}".`,
    });
  }

  // 2. Email borrower about request confirmation
  if (borrower) {
    const html = getBookingRequestedTemplate(
      borrower.fullName,
      tool.name,
      startDate,
      endDate,
      amount
    );
    triggerEmailInBackground(borrower.email, 'Rent-a-Tool Request Confirmed', html);
  }

  // 3. Email owner about request to check their requests page
  if (tool.ownerId) {
    const htmlOwner = `<p>Hi ${tool.ownerId.fullName},</p>
      <p>You have received a new rental request for <strong>${tool.name}</strong> from ${borrower?.fullName || 'a borrower'}.</p>
      <p>Log in to approve or reject the request.</p>`;
    triggerEmailInBackground(tool.ownerId.email, 'New Tool Booking Request Received', htmlOwner);
  }

  return booking;
}

// Handles booking status transitions (approve/reject/pickup/return).
// Validates transitions and updates the tool availability state dynamically.
async function updateBookingStatus(bookingId, userId, newStatus, extraData = {}) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const error = new Error('Booking not found');
    error.status = 404;
    throw error;
  }

  const tool = await Tool.findById(booking.toolId);
  if (!tool) {
    const error = new Error('Associated tool not found');
    error.status = 404;
    throw error;
  }

  const isOwner = booking.ownerId.toString() === userId.toString();
  const isBorrower = booking.borrowerId.toString() === userId.toString();

  switch (newStatus) {
    case 'approved':
      if (!isOwner) {
        const error = new Error('Only the tool owner can approve booking requests');
        error.status = 403;
        throw error;
      }
      if (booking.bookingStatus !== 'requested') {
        const error = new Error('Only requested bookings can be approved');
        error.status = 400;
        throw error;
      }

      // Re-verify overlap at approval time (in case another request was approved first)
      const hasOverlap = await checkDateOverlap(booking.toolId, booking.startDate, booking.endDate, booking._id);
      if (hasOverlap) {
        const error = new Error('Cannot approve. This date range overlaps with another approved booking.');
        error.status = 400;
        throw error;
      }

      booking.bookingStatus = 'approved';

      // Log security deposit hold in payments ledger
      await Payment.create({
        bookingId: booking._id,
        userId: booking.borrowerId,
        amount: booking.deposit,
        type: 'deposit',
        description: 'Security deposit hold (completed)',
      });

      // 1. In-App Notification to Borrower
      await Notification.create({
        recipientId: booking.borrowerId,
        senderId: userId,
        bookingId: booking._id,
        type: 'status_change',
        title: 'Rental Request Approved!',
        message: `Your request for "${tool.name}" has been approved by the lender.`,
      });

      // 2. Email borrower about approval
      User.findById(booking.borrowerId).then((borrower) => {
        if (borrower) {
          const html = getBookingApprovedTemplate(
            borrower.fullName,
            tool.name,
            booking.startDate,
            booking.endDate
          );
          triggerEmailInBackground(borrower.email, 'Rental Request Approved!', html);
        }
      }).catch(err => console.error(err));
      break;

    case 'rejected':
      if (!isOwner) {
        const error = new Error('Only the tool owner can reject booking requests');
        error.status = 403;
        throw error;
      }
      if (booking.bookingStatus !== 'requested') {
        const error = new Error('Only requested bookings can be rejected');
        error.status = 400;
        throw error;
      }

      booking.bookingStatus = 'rejected';

      // 1. In-App Notification to Borrower
      await Notification.create({
        recipientId: booking.borrowerId,
        senderId: userId,
        bookingId: booking._id,
        type: 'status_change',
        title: 'Rental Request Declined',
        message: `Your request for "${tool.name}" was declined.`,
      });

      // 2. Email borrower about rejection
      User.findById(booking.borrowerId).then((borrower) => {
        if (borrower) {
          const html = getBookingRejectedTemplate(borrower.fullName, tool.name);
          triggerEmailInBackground(borrower.email, 'Rental Request Declined', html);
        }
      }).catch(err => console.error(err));
      break;

    case 'active': // Pickup
      // Either borrower or owner can trigger pickup
      if (!isOwner && !isBorrower) {
        const error = new Error('Unauthorized to perform tool pickup');
        error.status = 403;
        throw error;
      }
      if (booking.bookingStatus !== 'approved') {
        const error = new Error('Tool can only be picked up for approved bookings');
        error.status = 400;
        throw error;
      }

      booking.bookingStatus = 'active';
      tool.status = 'booked';
      await tool.save();

      // Create deposit alert notification
      await Notification.create({
        recipientId: booking.borrowerId,
        bookingId: booking._id,
        type: 'deposit_alert',
        title: 'Security Deposit Active',
        message: `₹${booking.deposit} security deposit is now active for your rental of "${tool.name}".`,
      });
      break;

    case 'returned':
      // Either borrower or owner can trigger return
      if (!isOwner && !isBorrower) {
        const error = new Error('Unauthorized to perform tool return');
        error.status = 403;
        throw error;
      }
      if (booking.bookingStatus !== 'active') {
        const error = new Error('Only active rentals can be returned');
        error.status = 400;
        throw error;
      }

      booking.bookingStatus = 'returned';

      // ── Late Fee and Damage Fine Calculations with timings ──────────────────
      const now = new Date();
      const endDateTime = new Date(booking.endDate);
      if (booking.returnTime) {
        const [hours, minutes] = booking.returnTime.split(':').map(Number);
        endDateTime.setHours(hours, minutes, 0, 0);
      } else {
        endDateTime.setHours(23, 59, 59, 999);
      }

      const diffTime = now.getTime() - endDateTime.getTime();
      const daysLate = now > endDateTime ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
      
      const lateFee = daysLate * (tool.rentPerDay * 1.5 + (tool.customLateFeePerDay || 0));
      booking.lateFee = lateFee;

      let damageFine = 0;
      if (extraData.damageReported) {
        booking.isDamaged = true;
        booking.damageNotes = extraData.damageNotes || 'Damage reported on return';
        damageFine = tool.depositAmount * 0.5; // Flat 50% security deposit fine
        booking.damageFine = damageFine;
        tool.status = 'maintenance';
      } else {
        tool.status = 'available';
      }

      await tool.save();

      // ── Log Ledger Transactions ───────────────────────────────────────────
      const totalFines = lateFee + damageFine;
      
      if (totalFines > 0) {
        let fineDesc = 'Fines assessed: ';
        if (daysLate > 0) fineDesc += `${daysLate} days late (₹${lateFee})`;
        if (extraData.damageReported) fineDesc += `${daysLate > 0 ? ' + ' : ''}damage fine (₹${damageFine})`;

        await Payment.create({
          bookingId: booking._id,
          userId: booking.borrowerId,
          amount: totalFines,
          type: 'fine',
          description: fineDesc,
        });
      }

      const refundAmount = Math.max(0, booking.deposit - totalFines);
      await Payment.create({
        bookingId: booking._id,
        userId: booking.borrowerId,
        amount: refundAmount,
        type: 'refund',
        description: refundAmount > 0 ? 'Security deposit refund' : 'No refund (fines consumed entire deposit)',
      });

      // In-App Notification to borrower
      await Notification.create({
        recipientId: booking.borrowerId,
        senderId: userId,
        bookingId: booking._id,
        type: 'status_change',
        title: 'Tool Return Confirmed',
        message: `Your return for "${tool.name}" was confirmed. Total fines: ₹${totalFines}. Refund issued: ₹${refundAmount}.`,
      });

      // Email borrower about late return fines if applicable
      if (daysLate > 0) {
        User.findById(booking.borrowerId).then((borrower) => {
          if (borrower) {
            const html = getOverdueReminderTemplate(
              borrower.fullName,
              tool.name,
              daysLate,
              lateFee
            );
            triggerEmailInBackground(borrower.email, 'Overdue Tool Return Assessment', html);
          }
        }).catch(err => console.error(err));
      }
      break;

    default:
      const error = new Error(`Invalid status transition: ${newStatus}`);
      error.status = 400;
      throw error;
  }

  return await booking.save();
}

// Scans for overdue bookings and dispatches notifications automatically
async function checkAndNotifyOverdueBookings() {
  try {
    const now = new Date();
    const activeBookings = await Booking.find({
      bookingStatus: 'active',
      overdueAlertSent: false,
    }).populate('toolId borrowerId ownerId');

    for (const booking of activeBookings) {
      if (!booking.toolId || !booking.borrowerId || !booking.ownerId) continue;

      const endDateTime = new Date(booking.endDate);
      if (booking.returnTime) {
        const [hours, minutes] = booking.returnTime.split(':').map(Number);
        endDateTime.setHours(hours, minutes, 0, 0);
      } else {
        endDateTime.setHours(23, 59, 59, 999);
      }

      if (now > endDateTime) {
        booking.overdueAlertSent = true;
        await booking.save();

        // 1. Notify Borrower
        await Notification.create({
          recipientId: booking.borrowerId._id,
          senderId: booking.ownerId._id,
          bookingId: booking._id,
          type: 'overdue',
          title: '🚨 Overdue Tool Return Reminder',
          message: `Please return "${booking.toolId.name}" as soon as possible. Late returns will accumulate fine charges according to policy.`,
        });

        // 2. Notify Owner
        await Notification.create({
          recipientId: booking.ownerId._id,
          senderId: booking.borrowerId._id,
          bookingId: booking._id,
          type: 'overdue',
          title: '⚠️ Overdue Rental Notice',
          message: `The rental for "${booking.toolId.name}" is overdue. Contact borrower ${booking.borrowerId.fullName} at ${booking.borrowerId.phoneNumber || 'N/A'}.`,
        });

        // 3. Send Email notifications in background
        const htmlBorrower = getOverdueReminderTemplate(
          booking.borrowerId.fullName,
          booking.toolId.name,
          endDateTime
        );
        triggerEmailInBackground(booking.borrowerId.email, 'Overdue Tool Return Notice', htmlBorrower);

        const htmlOwner = `<p>Hi ${booking.ownerId.fullName},</p>
          <p>The tool <strong>${booking.toolId.name}</strong> is overdue for return by <strong>${booking.borrowerId.fullName}</strong>.</p>
          <p>You can contact them at <strong>${booking.borrowerId.phoneNumber || 'N/A'}</strong> to coordinate pick up.</p>`;
        triggerEmailInBackground(booking.ownerId.email, 'Overdue Tool Alert', htmlOwner);
      }
    }
  } catch (err) {
    console.error('Error running checkAndNotifyOverdueBookings:', err);
  }
}

module.exports = {
  createBooking,
  updateBookingStatus,
  checkDateOverlap,
  checkAndNotifyOverdueBookings,
};
