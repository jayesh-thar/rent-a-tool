const bookingService = require('./booking.service');
const Booking = require('./booking.model');

// POST /api/v1/bookings
// Creates a new rental request for a tool.
async function create(req, res, next) {
  try {
    const { toolId, startDate, endDate, returnTime } = req.body;

    if (!toolId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing toolId, startDate, or endDate' });
    }

    const booking = await bookingService.createBooking({
      toolId,
      borrowerId: req.user.userId,
      startDate,
      endDate,
      returnTime,
    });

    res.status(201).json({
      message: 'Booking request created successfully',
      booking,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/bookings/borrower
// Fetches the logged-in user's requested or active rentals.
async function listBorrowerBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ borrowerId: req.user.userId })
      .populate('toolId', 'name category images rentPerDay depositAmount customLateFeePerDay ownershipType')
      .populate('ownerId', 'fullName email phoneNumber userType communityDetails')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/bookings/lender
// Fetches rental requests received by the logged-in owner.
async function listLenderBookings(req, res, next) {
  try {
    const bookings = await Booking.find({ ownerId: req.user.userId })
      .populate('toolId', 'name category images rentPerDay depositAmount customLateFeePerDay ownershipType')
      .populate('borrowerId', 'fullName email phoneNumber userType communityDetails')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/bookings/:id/status
// Handles workflow updates (approvals, rejections, pickups, returns).
async function updateStatus(req, res, next) {
  try {
    const { status, damageReported, damageNotes } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const booking = await bookingService.updateBookingStatus(
      req.params.id,
      req.user.userId,
      status,
      { damageReported: !!damageReported, damageNotes }
    );

    res.json({
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  listBorrowerBookings,
  listLenderBookings,
  updateStatus,
};
