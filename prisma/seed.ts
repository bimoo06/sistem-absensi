import { prisma } from "../src/lib/db"

async function main() {
    // Check if admin exists to prevent duplicates on multiple runs
    const existingAdmin = await prisma.account.findUnique({
        where: { username: 'admin' },
    })

    if (!existingAdmin) {
        const admin = await prisma.account.create({
            data: {
                id: 'A-001',
                username: 'admin',
                password: 'admin123', // In real-world, hash this
                name: 'System Administrator',
                role: 'admin',
                gender: 'L',
                status: 'Aktif',
            },
        })
        console.log(`Created default admin account: ${admin.username}`)
    } else {
        console.log('Admin account already exists.')
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
