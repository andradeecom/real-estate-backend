import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ParseUUIDPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private readonly uuidPipe = new ParseUUIDPipe();

  @Post()
  @ApiCreatedResponse({ description: 'User created successfully' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOkResponse({ description: 'List of users retrieved successfully' })
  async findAll() {
    const data = await this.userService.findAll();
    return {
      code: 200,
      message: 'Users retrieved successfully',
      data,
    } 
  }

  @Get(':id')
  @ApiOkResponse({ description: 'User retrieved successfully' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  @ApiOkResponse({ description: 'User updated successfully' })
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateUserDto: UpdateUserDto) {
    // Should I add the code message here instead of service ?
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'User deleted successfully' })
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.remove(id);
  }
}
