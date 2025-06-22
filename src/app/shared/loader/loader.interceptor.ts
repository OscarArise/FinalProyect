import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { LoaderService } from './loader.service';
import { finalize } from 'rxjs';

export const LoaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(LoaderService);
  loader.show();
  return next(req).pipe(
    finalize(() => loader.hide())
  );
};
