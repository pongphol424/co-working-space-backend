import "dotenv/config"

interface Config{
    port: number;
    nodeEnv: string;
    secret: string;
}

if(!process.env.SECRET){
    throw new Error("Undefined process.env.SECRET")
}

const config:Config = {
    port: Number(process.env.PORT) ?? 3000,
    nodeEnv: process.env.NODE_ENV ?? 'development',
    secret: process.env.SECRET
};

export default config;


