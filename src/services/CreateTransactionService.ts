import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('Beware of Debits!');
    }

    let transactionCategoryName = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!transactionCategoryName) {
      transactionCategoryName = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(transactionCategoryName);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategoryName,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
