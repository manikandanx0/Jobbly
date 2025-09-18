import jwt from 'jsonwebtoken';
import { serialize, parse } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

/**
 * Verify JWT token from request
 */
export function verifyToken(req) {
  const token = req.cookies?.auth_token;
  
  if (!token) {
    return { isAuthenticated: false, user: null };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { isAuthenticated: true, user: decoded };
  } catch (error) {
    return { isAuthenticated: false, user: null };
  }
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(res, token, user) {
  const cookie = serialize('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2, // 2 hours
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(res) {
  const cookie = serialize('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}

/**
 * Higher-order function to protect pages with server-side authentication
 */
export function withAuth(getServerSideProps) {
  return async (context) => {
    const { req, res } = context;
    const { isAuthenticated, user } = verifyToken(req);

    if (!isAuthenticated) {
      return {
        redirect: {
          destination: '/auth',
          permanent: false,
        },
      };
    }

    // If getServerSideProps is provided, call it with user context
    if (getServerSideProps) {
      const result = await getServerSideProps(context, { user });
      return result;
    }

    // Return user data if no custom getServerSideProps
    return {
      props: {
        user,
      },
    };
  };
}

/**
 * Higher-order function for auth pages (redirect if already logged in)
 */
export function withAuthRedirect(getServerSideProps) {
  return async (context) => {
    const { req, res } = context;
    const { isAuthenticated, user } = verifyToken(req);

    if (isAuthenticated) {
      const redirectTo = context.query.redirect || '/';
      return {
        redirect: {
          destination: redirectTo,
          permanent: false,
        },
      };
    }

    // If getServerSideProps is provided, call it
    if (getServerSideProps) {
      const result = await getServerSideProps(context);
      return result;
    }

    return {
      props: {},
    };
  };
}
