export { default } from "next-auth/middleware"

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/analyze/:path*",
        "/writer/:path*",
        "/brand-generator/:path*",
        "/seo-optimizer/:path*",
        "/campaigns/:path*",
        "/leads/:path*",
        "/analytics/:path*",
        "/settings/:path*",
        "/billing/:path*",
        "/pricing-page/:path*",
        "/pricing-payment/:path*"
    ]
}
