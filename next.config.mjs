/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.firebasestorage.googleapis.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
        ],
    },
    webpack: (config, { isServer, webpack }) => {
        // Fix for node:process and other Node.js built-ins
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                url: false,
                zlib: false,
                http: false,
                https: false,
                assert: false,
                os: false,
                path: false,
                process: false,
            };
        }

        // Ignore node:process and other node: prefixed modules
        config.resolve.alias = {
            ...config.resolve.alias,
            'node:process': false,
        };

        // Ignore node: prefixed modules in client bundle
        config.plugins.push(
            new webpack.IgnorePlugin({
                resourceRegExp: /^node:/,
            })
        );

        return config;
    },
    // Exclude server-only modules from client bundle
    experimental: {
        serverComponentsExternalPackages: ['firebase-admin'],
    },
};

export default nextConfig;
