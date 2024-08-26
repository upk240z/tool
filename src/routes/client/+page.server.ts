/** @type {import('./$types').PageServerLoad} */
export async function load({getClientAddress}) {
  const ip = await getClientAddress()
  return {
    ip
  };
}
