const toolService = require('./tool.service');
const { uploadImage } = require('../../config/cloudinary');
const User = require('../auth/user.model');

// POST /api/v1/tools
// Creates a new tool listing. If a file is uploaded, pushes it to Cloudinary.
async function create(req, res, next) {
  try {
    const { name, category, description, condition, rentPerDay, depositAmount, customLateFeePerDay } = req.body;

    if (!name || !category || !condition || !rentPerDay || !depositAmount) {
      return res.status(400).json({ message: 'Missing required tool fields' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const ownershipType = user.userType === 'community' ? 'community' : 'personal';

    const images = [];
    if (req.file) {
      // Direct stream upload to Cloudinary (or mock)
      const uploadResult = await uploadImage(req.file.buffer);
      images.push(uploadResult.secure_url);
    } else {
      // Default tool placeholder image if no upload is specified
      images.push('https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=60');
    }

    const tool = await toolService.createTool({
      ownerId: req.user.userId,
      ownershipType,
      name,
      category,
      description,
      images,
      condition,
      rentPerDay: Number(rentPerDay),
      depositAmount: Number(depositAmount),
      customLateFeePerDay: Number(customLateFeePerDay || 0),
      status: 'available',
    });

    res.status(201).json({
      message: 'Tool created successfully',
      tool,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/tools
// Lists/browses tools with query filter parameters.
async function list(req, res, next) {
  try {
    const { category, ownershipType, status, search, available } = req.query;
    const tools = await toolService.getTools({
      category,
      ownershipType,
      status,
      search,
      available,
    });
    res.json({ tools });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/tools/:id
// Fetches detailed information about a single tool.
async function detail(req, res, next) {
  try {
    const tool = await toolService.getToolById(req.params.id);
    res.json({ tool });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/v1/tools/:id
// Updates tool details. Restricts editing to the tool owner.
async function update(req, res, next) {
  try {
    const { name, category, description, condition, rentPerDay, depositAmount, status, customLateFeePerDay } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const ownershipType = user.userType === 'community' ? 'community' : 'personal';

    // Build update object with only defined fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (condition !== undefined) updateData.condition = condition;
    if (rentPerDay !== undefined) updateData.rentPerDay = Number(rentPerDay);
    if (depositAmount !== undefined) updateData.depositAmount = Number(depositAmount);
    if (status !== undefined) updateData.status = status;
    if (customLateFeePerDay !== undefined) updateData.customLateFeePerDay = Number(customLateFeePerDay || 0);
    updateData.ownershipType = ownershipType;

    if (req.file) {
      const uploadResult = await uploadImage(req.file.buffer);
      updateData.images = [uploadResult.secure_url];
    }

    const tool = await toolService.updateTool(req.params.id, req.user.userId, updateData);

    res.json({
      message: 'Tool updated successfully',
      tool,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  create,
  list,
  detail,
  update,
};
