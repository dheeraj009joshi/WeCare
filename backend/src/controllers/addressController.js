const { getModels } = require('../models');

// Get user's addresses
exports.getUserAddresses = async (req, res) => {
  try {
    const { Address } = getModels();
    const userId = req.user.id;

    const addresses = await Address.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching addresses',
      error: error.message
    });
  }
};

// Add new address
exports.addAddress = async (req, res) => {
  try {
    const { Address } = getModels();
    const userId = req.user.id;
    const {
      name,
      address,
      phone,
      city,
      state,
      pincode,
      isDefault = false
    } = req.body;

    // Validate required fields
    if (!name || !address || !phone || !city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'All address fields are required'
      });
    }

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId } }
      );
    }

    const newAddress = await Address.create({
      userId,
      name,
      address,
      phone,
      city,
      state,
      pincode,
      isDefault
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: newAddress
    });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding address',
      error: error.message
    });
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const { Address } = getModels();
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    const address = await Address.findOne({
      where: { id, userId }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If this is set as default, unset other default addresses
    if (updateData.isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId, id: { [require('sequelize').Op.ne]: id } } }
      );
    }

    await address.update(updateData);

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating address',
      error: error.message
    });
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const { Address } = getModels();
    const userId = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({
      where: { id, userId }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await address.destroy();

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting address',
      error: error.message
    });
  }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
  try {
    const { Address } = getModels();
    const userId = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({
      where: { id, userId }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Unset all other default addresses
    await Address.update(
      { isDefault: false },
      { where: { userId } }
    );

    // Set this address as default
    await address.update({ isDefault: true });

    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting default address',
      error: error.message
    });
  }
};

// Get default address
exports.getDefaultAddress = async (req, res) => {
  try {
    const { Address } = getModels();
    const userId = req.user.id;

    const defaultAddress = await Address.findOne({
      where: { userId, isDefault: true }
    });

    res.json({
      success: true,
      data: defaultAddress
    });
  } catch (error) {
    console.error('Error fetching default address:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching default address',
      error: error.message
    });
  }
};
