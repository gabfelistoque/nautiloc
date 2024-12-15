import { withAuth } from 'next-auth/middleware';

// Protege apenas as rotas admin
export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      return !!token;
    },
  },
});

export const config = {
  matcher: ['/admin/:path*']
};
