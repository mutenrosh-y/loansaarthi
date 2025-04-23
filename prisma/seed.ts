import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Delhi branch
  const delhiBranch = await prisma.branch.upsert({
    where: { id: 'delhi-branch' },
    update: {},
    create: {
      id: 'delhi-branch',
      name: 'Delhi Branch',
      address: '123 Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
    },
  });

  // Create Mumbai branch
  const mumbaiBranch = await prisma.branch.upsert({
    where: { id: 'mumbai-branch' },
    update: {},
    create: {
      id: 'mumbai-branch',
      name: 'Mumbai Branch',
      address: '456 Nariman Point',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
    },
  });

  console.log({ delhiBranch, mumbaiBranch });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 