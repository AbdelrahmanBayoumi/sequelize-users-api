import { faker } from '@faker-js/faker';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private sequelize: Sequelize,
  ) {}

  async createMultipleUsers(): Promise<User[]> {
    const users = [];

    for (let i = 0; i < 1000; i++) {
      users.push({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      });
    }
    await this.userModel.bulkCreate(users);

    return users;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // return this.userModel.create({
    //   firstName: createUserDto.firstName,
    //   lastName: createUserDto.lastName,
    // });
    const query =
      'INSERT INTO "Users" ("id", "firstName", "lastName", "createdAt", "updatedAt") VALUES (DEFAULT, :firstName, :lastName, :createdAt, :updatedAt) RETURNING *';
    return this.sequelize
      .query(query, {
        model: User,
        mapToModel: true,
        replacements: {
          ...createUserDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .then((result) => result[0]);
  }

  async findAll(): Promise<User[]> {
    console.time('findAll');
    const result = await this.userModel.findAll();
    // const query = 'SELECT * FROM "Users"';
    // const result = await this.sequelize.query(query, {
    //   model: User,
    //   mapToModel: true,
    // });
    console.timeEnd('findAll');
    return result;
  }

  async findOne(id: string): Promise<User> {
    // return this.userModel.findOne({
    //   where: {
    //     id,
    //   },
    // });
    const query = 'SELECT * FROM "Users" WHERE "id" = :id';
    const result = await this.sequelize.query(query, {
      model: User,
      mapToModel: true,
      replacements: { id },
    });
    return result[0];
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    await user.destroy();
  }
}
