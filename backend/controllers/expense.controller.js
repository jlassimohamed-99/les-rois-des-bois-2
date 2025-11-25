import Expense from '../models/Expense.model.js';

export const getExpenses = async (req, res, next) => {
  try {
    const { category, startDate, endDate, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (category) query.category = category;
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) query.expenseDate.$lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate('supplierId', 'name')
        .populate('recordedBy', 'name email')
        .sort({ expenseDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Expense.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      recordedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'المصروف غير موجود' });
    }
    res.json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'المصروف غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف المصروف بنجاح' });
  } catch (error) {
    next(error);
  }
};

