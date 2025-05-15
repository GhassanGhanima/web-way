import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException, ValidationError } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  constructor(private readonly i18nService: I18nService) {}

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      const lang = 'en'; // Would get from request in a real implementation
      const message = await this.i18nService.translate('common.errors.validation', { lang });
      
      throw new BadRequestException({
        message,
        errors: formattedErrors,
      });
    }

    return value;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: ValidationError[]) {
    return errors.reduce((acc, error) => {
      acc[error.property] = Object.values(error.constraints || {});
      if (error.children && error.children.length > 0) {
        acc[error.property] = this.formatErrors(error.children);
      }
      return acc;
    }, {});
  }
}
