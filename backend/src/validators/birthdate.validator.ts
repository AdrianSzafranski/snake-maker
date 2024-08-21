import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsCorrectBirthDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCorrectBirthDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string')
            return false;

          const date = new Date(value);
          const now = new Date();
          const pastDateLimit = new Date(now.getTime() - 3784320000000); // 120 years ago
      
          // Check if date is invalid
          if (isNaN(date.getTime())) {
            return false;
          }
      
          // Validate date range
          return date <= now && date >= pastDateLimit;

        },
        defaultMessage(args: ValidationArguments) {
          return 'birthdate.invalid';
        },
      },
    });
  };
}