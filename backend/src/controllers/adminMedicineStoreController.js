const { getModels } = require('../models');
const { Op } = require('sequelize');

class AdminMedicineStoreController {
  // Get all products with filtering and search
  async getProducts(req, res) {
    try {
      const { Product } = getModels();
      const { search, category, prescription, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      
      if (search) {
        whereClause = {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { category: { [Op.iLike]: `%${search}%` } },
            { manufacturer: { [Op.iLike]: `%${search}%` } },
            { dosha: { [Op.iLike]: `%${search}%` } }
          ]
        };
      }

      if (category && category !== 'All') {
        whereClause.category = category;
      }

      if (prescription !== undefined) {
        whereClause.prescription = prescription === 'true';
      }

      const products = await Product.findAndCountAll({
        where: whereClause,
        attributes: [
          'id', 'name', 'price', 'stock', 'category', 'prescription',
          'dosha', 'manufacturer', 'isActive', 'createdAt'
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          products: products.rows,
          total: products.count,
          currentPage: parseInt(page),
          totalPages: Math.ceil(products.count / limit)
        }
      });
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get products',
        error: error.message
      });
    }
  }

  // Add new product
  async addProduct(req, res) {
    try {
      const { Product } = getModels();
      const {
        name,
        price,
        stock,
        category,
        prescription,
        dosha,
        benefits,
        description,
        manufacturer,
        expiryDate
      } = req.body;

      // Check if product already exists
      const existingProduct = await Product.findOne({
        where: { name }
      });

      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this name already exists'
        });
      }

      // Create product
      const product = await Product.create({
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        prescription: prescription || false,
        dosha,
        benefits,
        description,
        manufacturer,
        expiryDate: expiryDate || null,
        isActive: true
      });

      res.status(201).json({
        success: true,
        message: 'Product added successfully',
        data: product
      });
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add product',
        error: error.message
      });
    }
  }

  // Update product
  async updateProduct(req, res) {
    try {
      const { Product } = getModels();
      const { id } = req.params;
      const updateData = req.body;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Update product
      await product.update(updateData);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message
      });
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    try {
      const { Product } = getModels();
      const { id } = req.params;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await product.destroy();

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message
      });
    }
  }

  // Get product details
  async getProductDetails(req, res) {
    try {
      const { Product } = getModels();
      const { id } = req.params;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error getting product details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get product details',
        error: error.message
      });
    }
  }

  // Update product stock
  async updateProductStock(req, res) {
    try {
      const { Product } = getModels();
      const { id } = req.params;
      const { stock } = req.body;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await product.update({ stock: parseInt(stock) });

      res.json({
        success: true,
        message: 'Product stock updated successfully',
        data: {
          id: product.id,
          name: product.name,
          stock: product.stock
        }
      });
    } catch (error) {
      console.error('Error updating product stock:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product stock',
        error: error.message
      });
    }
  }

  // Get product categories
  async getProductCategories(req, res) {
    try {
      const { Product } = getModels();
      const categories = await Product.findAll({
        attributes: [[Product.sequelize.fn('DISTINCT', Product.sequelize.col('category')), 'category']],
        raw: true
      });

      const categoryList = categories.map(cat => cat.category).filter(Boolean);

      res.json({
        success: true,
        data: categoryList
      });
    } catch (error) {
      console.error('Error getting product categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get product categories',
        error: error.message
      });
    }
  }

  // Get low stock products
  async getLowStockProducts(req, res) {
    try {
      const { Product } = getModels();
      const { threshold = 10 } = req.query;

      const lowStockProducts = await Product.findAll({
        where: {
          stock: {
            [Op.lte]: parseInt(threshold)
          },
          isActive: true
        },
        attributes: ['id', 'name', 'stock', 'category'],
        order: [['stock', 'ASC']]
      });

      res.json({
        success: true,
        data: lowStockProducts
      });
    } catch (error) {
      console.error('Error getting low stock products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get low stock products',
        error: error.message
      });
    }
  }

  // Toggle product status
  async toggleProductStatus(req, res) {
    try {
      const { Product } = getModels();
      const { id } = req.params;

      const product = await Product.findByPk(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await product.update({ isActive: !product.isActive });

      res.json({
        success: true,
        message: 'Product status updated successfully',
        data: {
          id: product.id,
          name: product.name,
          isActive: product.isActive
        }
      });
    } catch (error) {
      console.error('Error toggling product status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product status',
        error: error.message
      });
    }
  }
}

module.exports = new AdminMedicineStoreController();
