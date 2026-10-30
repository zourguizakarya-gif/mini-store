import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChatDto {
  // check if string with the typeof and return the value trimmed 
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;
}
//@Transform  → safely clean the value
//@IsString   → validate the value
//@IsNotEmpty → validate it's not empty
//@MaxLength  → validate its length