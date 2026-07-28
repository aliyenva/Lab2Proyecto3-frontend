import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('should send POST to /api/auth/login and store token, username, role', () => {
      const mockResponse = { token: 'abc123', username: 'testuser', role: 'USER' };

      service.login('testuser', 'pass123').subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('jwt_token')).toBe('abc123');
        expect(localStorage.getItem('username')).toBe('testuser');
        expect(localStorage.getItem('role')).toBe('USER');
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'testuser', password: 'pass123' });
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should send POST to /api/auth/register', () => {
      service.register('newuser', 'newpass').subscribe();

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'newuser', password: 'newpass' });
      req.flush(null);
    });
  });

  describe('logout', () => {
    it('should clear all session data from localStorage', () => {
      localStorage.setItem('jwt_token', 'token');
      localStorage.setItem('username', 'user');
      localStorage.setItem('role', 'ADMIN');

      service.logout();

      expect(localStorage.getItem('jwt_token')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      expect(localStorage.getItem('role')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('jwt_token', 'mytoken');
      expect(service.getToken()).toBe('mytoken');
    });

    it('should return null when no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getUsername', () => {
    it('should return username from localStorage', () => {
      localStorage.setItem('username', 'admin');
      expect(service.getUsername()).toBe('admin');
    });

    it('should return null when no username exists', () => {
      expect(service.getUsername()).toBeNull();
    });
  });

  describe('getRole', () => {
    it('should return role from localStorage', () => {
      localStorage.setItem('role', 'SUPER-ADMIN-ROLE');
      expect(service.getRole()).toBe('SUPER-ADMIN-ROLE');
    });

    it('should return null when no role exists', () => {
      expect(service.getRole()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('jwt_token', 'sometoken');
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  describe('hasRole', () => {
    it('should return true when stored role matches', () => {
      localStorage.setItem('role', 'SUPER-ADMIN-ROLE');
      expect(service.hasRole('SUPER-ADMIN-ROLE')).toBeTrue();
    });

    it('should return false when stored role does not match', () => {
      localStorage.setItem('role', 'USER');
      expect(service.hasRole('SUPER-ADMIN-ROLE')).toBeFalse();
    });

    it('should return false when no role is stored', () => {
      expect(service.hasRole('USER')).toBeFalse();
    });
  });

  describe('clearSession', () => {
    it('should remove token, username, and role from localStorage', () => {
      localStorage.setItem('jwt_token', 'token');
      localStorage.setItem('username', 'user');
      localStorage.setItem('role', 'ROLE');

      service.clearSession();

      expect(localStorage.getItem('jwt_token')).toBeNull();
      expect(localStorage.getItem('username')).toBeNull();
      expect(localStorage.getItem('role')).toBeNull();
    });
  });
});
