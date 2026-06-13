import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { CourseService } from '../services/course.service';
import { map, of, catchError } from 'rxjs';

/**
 * Enrolled Guard
 * 
 * Prevents students from accessing the learning player if they are not enrolled in the course.
 */
export const enrolledGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const courseService = inject(CourseService);
  const courseId = route.paramMap.get('courseId');

  if (!courseId) {
    router.navigate(['/courses']);
    return of(false);
  }

  return courseService.getCourse(courseId).pipe(
    map(course => {
      if (course && course.isEnrolled) {
        return true;
      } else {
        // Not enrolled, redirect to detail page
        router.navigate(['/courses', courseId]);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/courses']);
      return of(false);
    })
  );
};
