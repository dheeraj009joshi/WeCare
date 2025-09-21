const { getModels } = require('../models');
const { Op } = require('sequelize');

// Newsletter subscription
const subscribeNewsletter = async (req, res) => {
  try {
    const { Newsletter } = getModels();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if email already exists
    const existingSubscription = await Newsletter.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (existingSubscription) {
      if (existingSubscription.status === 'active') {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is already subscribed to newsletter' 
        });
      } else {
        // Reactivate subscription
        await existingSubscription.update({ 
          status: 'active',
          unsubscribedAt: null
        });
        return res.json({ 
          success: true, 
          message: 'Newsletter subscription reactivated successfully' 
        });
      }
    }

    // Create new subscription
    const newsletter = await Newsletter.create({
      email: email.toLowerCase(),
      status: 'active',
      source: 'footer'
    });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: { id: newsletter.id, email: newsletter.email }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Unsubscribe from newsletter
const unsubscribeNewsletter = async (req, res) => {
  try {
    const { Newsletter } = getModels();
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const subscription = await Newsletter.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    await subscription.update({ 
      status: 'unsubscribed',
      unsubscribedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Submit contact form
const submitContact = async (req, res) => {
  try {
    const { Contact } = getModels();
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const contact = await Contact.create({
      name,
      email: email.toLowerCase(),
      subject,
      message,
      source: 'footer',
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: { id: contact.id, subject: contact.subject }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all contacts (admin only)
const getAllContacts = async (req, res) => {
  try {
    const { Contact } = getModels();
    const { page = 1, limit = 10, status, priority } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    const contacts = await Contact.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: require('../models/Doctor'),
        as: 'assignedDoctor',
        attributes: ['id', 'name', 'email']
      }]
    });

    res.json({
      success: true,
      data: contacts.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(contacts.count / limit),
        totalItems: contacts.count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update contact status (admin only)
const updateContactStatus = async (req, res) => {
  try {
    const { Contact } = getModels();
    const { id } = req.params;
    const { status, priority, assignedTo, notes } = req.body;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact not found' 
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (notes !== undefined) updateData.notes = notes;
    
    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    await contact.update(updateData);

    res.json({
      success: true,
      message: 'Contact updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get footer content
const getFooterContent = async (req, res) => {
  try {
    const { FooterContent } = getModels();
    const footerContent = await FooterContent.findAll({
      where: { isActive: true },
      order: [['type', 'ASC'], ['order', 'ASC']]
    });

    // Organize content by type
    const organizedContent = {
      social_media: [],
      company_info: [],
      quick_links: [],
      contact_info: []
    };

    footerContent.forEach(item => {
      if (organizedContent[item.type]) {
        organizedContent[item.type].push({
          key: item.key,
          value: item.value,
          label: item.label,
          metadata: item.metadata
        });
      }
    });

    res.json({
      success: true,
      data: organizedContent
    });

  } catch (error) {
    console.error('Get footer content error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update footer content (admin only)
const updateFooterContent = async (req, res) => {
  try {
    const { FooterContent } = getModels();
    const { type, key, value, label, order, isActive, metadata } = req.body;

    if (!type || !key || !value) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type, key, and value are required' 
      });
    }

    let footerContent = await FooterContent.findOne({
      where: { type, key }
    });

    if (footerContent) {
      // Update existing content
      await footerContent.update({
        value,
        label,
        order: order || footerContent.order,
        isActive: isActive !== undefined ? isActive : footerContent.isActive,
        metadata: metadata || footerContent.metadata
      });
    } else {
      // Create new content
      footerContent = await FooterContent.create({
        type,
        key,
        value,
        label,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        metadata: metadata || {}
      });
    }

    res.json({
      success: true,
      message: 'Footer content updated successfully',
      data: footerContent
    });

  } catch (error) {
    console.error('Update footer content error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get newsletter statistics (admin only)
const getNewsletterStats = async (req, res) => {
  try {
    const { Newsletter } = getModels();
    const totalSubscribers = await Newsletter.count({
      where: { status: 'active' }
    });

    const newSubscribersThisMonth = await Newsletter.count({
      where: {
        status: 'active',
        subscribedAt: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    const unsubscribedThisMonth = await Newsletter.count({
      where: {
        status: 'unsubscribed',
        unsubscribedAt: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalSubscribers,
        newSubscribersThisMonth,
        unsubscribedThisMonth,
        netGrowth: newSubscribersThisMonth - unsubscribedThisMonth
      }
    });

  } catch (error) {
    console.error('Get newsletter stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  subscribeNewsletter,
  unsubscribeNewsletter,
  submitContact,
  getAllContacts,
  updateContactStatus,
  getFooterContent,
  updateFooterContent,
  getNewsletterStats
};
