import prisma from '../src/utils/prisma.js';

const loginIdArg = process.argv[2];

if (!loginIdArg) {
  console.error('Please provide a loginId as an argument.');
  console.error('Usage: npx tsx scripts/makeAdmin.ts <loginId>');
  process.exit(1);
}

const loginId = loginIdArg as string;

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { loginId },
    });

    if (!user) {
      console.error(`User with loginId "${loginId}" not found.`);
      process.exit(1);
    }

    const updatedUser = await prisma.user.update({
      where: { loginId },
      data: {
        role: 'Super Admin',
        permissions: {
          upsert: {
            create: {
              dashboard: true,
              inventory: true,
              operations: true,
              audit_log: true,
              settings: true,
              user_mgmt: true,
            },
            update: {
              dashboard: true,
              inventory: true,
              operations: true,
              audit_log: true,
              settings: true,
              user_mgmt: true,
            },
          },
        },
      },
      include: { permissions: true },
    });

    console.log(`User "${updatedUser.name}" (${updatedUser.loginId}) is now a Super Admin.`);
    // @ts-ignore
    console.log('Permissions:', updatedUser.permissions);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
