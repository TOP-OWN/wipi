import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './tag.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>
  ) {}

  /**
   * 添加标签
   * @param tag
   */
  async create(tag: Partial<Tag>): Promise<Tag> {
    const { label } = tag;
    const existTag = await this.tagRepository.findOne({ where: { label } });

    if (existTag) {
      throw new HttpException('标签已存在', HttpStatus.BAD_REQUEST);
    }

    const newTag = await this.tagRepository.create(tag);
    await this.tagRepository.save(newTag);
    return newTag;
  }

  /**
   * 获取所有标签
   */
  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find({ order: { createAt: 'ASC' } });
  }

  /**
   * 获取指定标签
   * @param id
   */
  async findById(id): Promise<Tag> {
    return this.tagRepository.findOne(id);
  }

  /**
   * 获取指定标签信息，包含相关文章
   * @param id
   */
  async getArticleById(id, status = null): Promise<Tag> {
    const data = await this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.articles', 'articles')
      .orderBy('articles.updateAt', 'DESC')
      .where('tag.id=:id')
      .orWhere('tag.label=:id')
      .orWhere('tag.value=:id')
      .setParameter('id', id)
      .getOne();

    if (status) {
      data.articles = data.articles.filter(a => a.status === status);
      return data;
    } else {
      return data;
    }
  }

  async findByIds(ids): Promise<Array<Tag>> {
    return this.tagRepository.findByIds(ids);
  }

  /**
   * 更新标签
   * @param id
   * @param tag
   */
  async updateById(id, tag: Partial<Tag>): Promise<Tag> {
    const oldTag = await this.tagRepository.findOne(id);
    const updatedTag = await this.tagRepository.merge(oldTag, tag);
    return this.tagRepository.save(updatedTag);
  }

  /**
   * 删除标签
   * @param id
   */
  async deleteById(id) {
    const tag = await this.tagRepository.findOne(id);
    return this.tagRepository.remove(tag);
  }
}
