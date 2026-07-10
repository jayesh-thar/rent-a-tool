// Standard styling template wrapping the email content body in clean html
function wrapInLayout(title, content) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
      <div style="text-align: center; border-bottom: 2px solid #f59e0b; padding-bottom: 15px; margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0;">Rent-a-Tool Library</h2>
      </div>
      <div style="padding: 10px 0;">
        <h3 style="color: #1e293b; margin-top: 0;">${title}</h3>
        ${content}
      </div>
      <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 25px; font-size: 11px; color: #64748b;">
        <p>This is an automated notification from your Rent-a-Tool Community Library account.</p>
      </div>
    </div>
  `;
}

function getBookingRequestedTemplate(borrowerName, toolName, startDate, endDate, amount) {
  const content = `
    <p>Hello ${borrowerName},</p>
    <p>Your booking request for <strong>${toolName}</strong> has been received by the tool owner.</p>
    <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 15px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Rental Details:</strong></p>
      <ul style="margin: 0; padding-left: 20px; color: #334155;">
        <li>Start Date: ${new Date(startDate).toLocaleDateString()}</li>
        <li>End Date: ${new Date(endDate).toLocaleDateString()}</li>
        <li>Estimated Rent Cost: ₹${amount}</li>
      </ul>
    </div>
    <p>We will email you as soon as the tool owner approves or updates your request status.</p>
  `;
  return wrapInLayout('Booking Request Confirmed', content);
}

function getBookingApprovedTemplate(borrowerName, toolName, startDate, endDate) {
  const content = `
    <p>Hello ${borrowerName},</p>
    <p>🎉 Good news! Your booking request for <strong>${toolName}</strong> has been <strong>approved</strong> by the owner.</p>
    <p>You can now arrange for tool handover starting on <strong>${new Date(startDate).toLocaleDateString()}</strong>.</p>
    <p>Please log in to your dashboard and mark the tool as "Picked Up" once you have received it.</p>
  `;
  return wrapInLayout('Rental Request Approved!', content);
}

function getBookingRejectedTemplate(borrowerName, toolName) {
  const content = `
    <p>Hello ${borrowerName},</p>
    <p>Your booking request for <strong>${toolName}</strong> has been declined by the owner.</p>
    <p>This is usually due to unexpected maintenance or availability conflicts. Please check the catalog to request alternative tools.</p>
  `;
  return wrapInLayout('Rental Request Declined', content);
}

function getOverdueReminderTemplate(borrowerName, toolName, daysLate, lateFee) {
  const content = `
    <p>Hello ${borrowerName},</p>
    <p style="color: #ef4444; font-weight: bold;">⚠️ URGENT REMINDER: Overdue Tool Rental</p>
    <p>Your rental of <strong>${toolName}</strong> is currently <strong>${daysLate} days past its return date</strong>.</p>
    <p>An overdue fine has been assessed under library policy:</p>
    <div style="background-color: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px; margin: 15px 0; color: #991b1b;">
      <p style="margin: 0;"><strong>Fines Assessed:</strong> ₹${lateFee} (1.5x standard rate)</p>
    </div>
    <p>Please return the tool to the owner as soon as possible to prevent further late fee accumulation.</p>
  `;
  return wrapInLayout('Overdue Tool Return Alert', content);
}

module.exports = {
  getBookingRequestedTemplate,
  getBookingApprovedTemplate,
  getBookingRejectedTemplate,
  getOverdueReminderTemplate,
};
