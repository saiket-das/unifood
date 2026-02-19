import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class PasswordChangeGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    // GraphQL context — skip HTTP-specific guard logic
    if (context.getType<string>() === 'graphql') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Check if user is authenticated and needs to change password
    if (user && user.needsPasswordChange) {
      // Allow only the "change-password" endpoint
      const routePath = request.route?.path;
      if (routePath && routePath.includes('/auth/change-password')) {
        return true;
      }

      throw new ForbiddenException('You must change your password before accessing this resource');
    }

    return true;
  }
}
