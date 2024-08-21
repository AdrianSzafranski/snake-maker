import { registerDecorator, ValidationOptions, ValidationArguments, isISO8601 } from 'class-validator';

export function IsCorrectISO8601Date(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCorrectISO8601Date',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any, args: ValidationArguments) {
            return typeof value === 'string' && isISO8601(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'WRONG_DATE_FORMAT';
        },
      },
    });
  };
}