import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './file.service';

@Controller('file')
@UseGuards(RolesGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * 上传文件
   * @param file
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fieldSize: 50 * 1024 * 1024,
      },
    })
  )
  @UseGuards(JwtAuthGuard)
  uploadFile(@UploadedFile() file) {
    return this.fileService.uploadFile(file);
  }

  /**
   * 获取所有文件
   */
  @Get()
  findAll(@Query() queryParam) {
    return this.fileService.findAll(queryParam);
  }

  /**
   * 获取指定文件
   * @param id
   */
  @Get(':id')
  findById(@Param('id') id) {
    return this.fileService.findById(id);
  }

  /**
   * 删除文件
   * @param id
   */
  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  deleteById(@Param('id') id) {
    return this.fileService.deleteById(id);
  }
}
