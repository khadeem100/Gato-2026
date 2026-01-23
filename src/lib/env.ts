export const isClient = () => {
  return !import.meta.env.SSR;
};


//.env fix toepassen voor de ctx.domain.com