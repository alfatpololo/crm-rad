import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const turboEmpty = path.join(__dirname, 'src/lib/turbo-empty.js');

/** Alias node:* ke stub — sama maksudnya dengan webpack client fallbacks di bawah */
const turboNodeBuiltins = [
    'node:process',
    'node:fs',
    'node:net',
    'node:tls',
    'node:crypto',
    'node:stream',
    'node:url',
    'node:zlib',
    'node:http',
    'node:https',
    'node:assert',
    'node:os',
    'node:path',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@tanstack/react-table'],
    // Dev: jangan buang chunk rute terlalu cepat — kalau kecil, tiap klik /dashboard
    // bisa kelihatan "Compiling..." lagi walau modulnya sama.
    onDemandEntries: {
        maxInactiveAge: 45 * 60 * 1000,
        pagesBufferLength: 20,
    },
    sassOptions: {
        // Percepat resolve @import di theme.scss (ratusan partial)
        includePaths: [path.join(__dirname, 'src/assets/scss')],
        quietDeps: true,
        // Bootstrap 5 + tema masih @import / API lama → ratusan warning memperlambat Turbopack & memicu "Error logging while running loader"
        silenceDeprecations: [
            'legacy-js-api',
            'import',
            'global-builtin',
            'color-functions',
            'color-4-api',
            'abs-percent',
            'if-function',
            'function-units',
            'slash-div',
        ],
    },
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
    experimental: {
        // Hindari chunk server "vendor-chunks/@opentelemetry.js" hilang saat firebase-admin / GCloud narik OTel transitive
        serverComponentsExternalPackages: ['firebase-admin', '@opentelemetry/api'],
        // Jangan sertakan @tanstack/react-table — optimizePackageImports merusak parse ESM (build error sourceType: module)
        optimizePackageImports: ['react-icons', 'date-fns'],
        turbo: {
            resolveAlias: Object.fromEntries(
                turboNodeBuiltins.map((name) => [name, turboEmpty])
            ),
        },
    },
};

export default nextConfig;
