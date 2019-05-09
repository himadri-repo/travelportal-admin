import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceStringPipe'
})
export class ReplaceStringPipePipe implements PipeTransform {
  transform(value: string, find: string, replace: string): string {
    return value.replace(find, replace);
  }
}
