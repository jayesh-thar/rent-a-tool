const Tool = require('./tool.model');

// Creates a new tool in the library database.
async function createTool(toolData) {
  return await Tool.create(toolData);
}

// Queries tools with filters and search.
async function getTools({ category, ownershipType, status, search, available, ownerId }) {
  const query = {};

  if (category) {
    query.category = category;
  }

  if (ownershipType) {
    query.ownershipType = ownershipType;
  }

  if (status) {
    query.status = status;
  }

  if (available === 'true') {
    query.status = 'available';
  }

  if (ownerId) {
    query.ownerId = ownerId;
  }

  if (search) {
    // Basic search by case-insensitive partial match on name or description
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Populate owner info (excluding password hashes)
  return await Tool.find(query)
    .populate('ownerId', 'fullName email profilePicture userType communityDetails')
    .sort({ createdAt: -1 });
}

// Retrieves tool details populated with owner info.
async function getToolById(id) {
  const tool = await Tool.findById(id).populate('ownerId', 'fullName email profilePicture userType communityDetails');
  if (!tool) {
    const error = new Error('Tool not found');
    error.status = 404;
    throw error;
  }
  return tool;
}

// Updates an existing tool. Verifies that the user requesting the edit
// is the owner of the tool, rejecting modifications otherwise.
async function updateTool(id, userId, updateData) {
  const tool = await Tool.findById(id);
  if (!tool) {
    const error = new Error('Tool not found');
    error.status = 404;
    throw error;
  }

  // Ensure owner checks match exactly (check string representations of IDs)
  if (tool.ownerId.toString() !== userId.toString()) {
    const error = new Error('Access denied — you do not own this tool');
    error.status = 403;
    throw error;
  }

  // Update properties
  Object.keys(updateData).forEach((key) => {
    if (updateData[key] !== undefined) {
      tool[key] = updateData[key];
    }
  });

  return await tool.save();
}

// Deletes a tool. Verifies ownership and checks for active/pending/approved bookings.
async function deleteTool(id, userId) {
  const tool = await Tool.findById(id);
  if (!tool) {
    const error = new Error('Tool not found');
    error.status = 404;
    throw error;
  }

  // Ensure owner checks match exactly (check string representations of IDs)
  if (tool.ownerId.toString() !== userId.toString()) {
    const error = new Error('Access denied — you do not own this tool');
    error.status = 403;
    throw error;
  }

  // Check if there are active, approved, or pending (requested) bookings
  const Booking = require('../bookings/booking.model');
  const activeBooking = await Booking.findOne({
    toolId: id,
    bookingStatus: { $in: ['requested', 'approved', 'active'] },
  });

  if (activeBooking) {
    const error = new Error('Cannot delete tool with pending, approved, or active bookings');
    error.status = 400;
    throw error;
  }

  return await Tool.findByIdAndDelete(id);
}

module.exports = {
  createTool,
  getTools,
  getToolById,
  updateTool,
  deleteTool,
};
