const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/transactions';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only image files and PDFs
  const allowedTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF) and PDF files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// @route   GET /api/transactions
// @desc    Get all transactions for user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, category } = req.query;
    
    // Build query filter
    const filter = { userId: req.user.id };
    
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.category = new RegExp(category, 'i');

    // Calculate pagination
    const skip = (page - 1) * limit;
    const limitNum = parseInt(limit);

    // Get transactions with pagination
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalItems = await Transaction.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limitNum);

    // Format transactions for frontend compatibility
    const formattedTransactions = transactions.map(transaction => ({
      id: transaction._id.toString(),
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency || 'INR',
      category: transaction.category,
      date: transaction.date,
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes,
      status: transaction.status,
      attachment: transaction.attachment,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    }));

    res.json({
      status: 'success',
      data: {
        transactions: formattedTransactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems,
          itemsPerPage: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching transactions'
    });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get single transaction
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).lean();

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    // Format transaction for frontend compatibility
    const formattedTransaction = {
      id: transaction._id.toString(),
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency || 'USD',
      category: transaction.category,
      date: transaction.date,
      paymentMethod: transaction.paymentMethod,
      notes: transaction.notes,
      status: transaction.status,
      attachment: transaction.attachment,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt
    };

    res.json({
      status: 'success',
      data: {
        transaction: formattedTransaction
      }
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching transaction'
    });
  }
});

// @route   POST /api/transactions
// @desc    Create new transaction
// @access  Private
router.post('/', authenticateToken, upload.single('attachment'), async (req, res) => {
  try {
    const { type, amount, currency, category, date, paymentMethod, notes } = req.body;

    // Basic validation
    if (!type || !amount || !category) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide type, amount, and category'
      });
    }

    // Handle file attachment
    let attachmentPath = null;
    if (req.file) {
      attachmentPath = `/uploads/transactions/${req.file.filename}`;
    }

    // Create new transaction
    const newTransaction = new Transaction({
      userId: req.user.id,
      type,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      category,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'cash',
      notes: notes || '',
      status: 'completed',
      attachment: attachmentPath
    });

    // Save to database
    const savedTransaction = await newTransaction.save();

    // Format for frontend compatibility
    const formattedTransaction = {
      id: savedTransaction._id.toString(),
      type: savedTransaction.type,
      amount: savedTransaction.amount,
      currency: savedTransaction.currency || 'USD',
      category: savedTransaction.category,
      date: savedTransaction.date,
      paymentMethod: savedTransaction.paymentMethod,
      notes: savedTransaction.notes,
      status: savedTransaction.status,
      attachment: savedTransaction.attachment,
      createdAt: savedTransaction.createdAt,
      updatedAt: savedTransaction.updatedAt
    };

    res.status(201).json({
      status: 'success',
      message: 'Transaction created successfully',
      data: {
        transaction: formattedTransaction
      }
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while creating transaction'
    });
  }
});

// @route   PUT /api/transactions/:id
// @desc    Update transaction
// @access  Private
router.put('/:id', authenticateToken, upload.single('attachment'), async (req, res) => {
  try {
    const { type, amount, category, date, paymentMethod, notes, status } = req.body;

    // Handle file attachment
    let attachmentPath = undefined;
    if (req.file) {
      attachmentPath = `/uploads/transactions/${req.file.filename}`;
    }

    // Build update object
    const updateData = {
      ...(type && { type }),
      ...(amount !== undefined && { amount: parseFloat(amount) }),
      ...(category && { category }),
      ...(date && { date: new Date(date) }),
      ...(paymentMethod && { paymentMethod }),
      ...(notes !== undefined && { notes }),
      ...(status && { status }),
      ...(attachmentPath !== undefined && { attachment: attachmentPath })
    };

    // Find and update transaction
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedTransaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    // Format for frontend compatibility
    const formattedTransaction = {
      id: updatedTransaction._id.toString(),
      type: updatedTransaction.type,
      amount: updatedTransaction.amount,
      currency: updatedTransaction.currency || 'USD',
      category: updatedTransaction.category,
      date: updatedTransaction.date,
      paymentMethod: updatedTransaction.paymentMethod,
      notes: updatedTransaction.notes,
      status: updatedTransaction.status,
      attachment: updatedTransaction.attachment,
      createdAt: updatedTransaction.createdAt,
      updatedAt: updatedTransaction.updatedAt
    };

    res.json({
      status: 'success',
      message: 'Transaction updated successfully',
      data: {
        transaction: formattedTransaction
      }
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Server error while updating transaction'
    });
  }
});

// @route   DELETE /api/transactions/:id
// @desc    Delete transaction
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!deletedTransaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Transaction deleted successfully'
    });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting transaction'
    });
  }
});

// @route   GET /api/transactions/stats/summary
// @desc    Get transaction statistics
// @access  Private
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Aggregate statistics
    const stats = await Transaction.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$type', 'income'] }, { $eq: ['$status', 'completed'] }] },
                '$amount',
                0
              ]
            }
          },
          totalExpenses: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$type', 'expense'] }, { $eq: ['$status', 'completed'] }] },
                '$amount',
                0
              ]
            }
          },
          pendingTransactions: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    const summary = stats[0] || {
      totalIncome: 0,
      totalExpenses: 0,
      pendingTransactions: 0,
      totalTransactions: 0
    };

    summary.balance = summary.totalIncome - summary.totalExpenses;

    res.json({
      status: 'success',
      data: {
        summary
      }
    });

  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching transaction statistics'
    });
  }
});

module.exports = router;
