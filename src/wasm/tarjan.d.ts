declare const createTarjanModule: (
  opts?: object
) => Promise<{
  ccall: (name: string, ret: string, types: string[], args: unknown[]) => string;
}>;
export default createTarjanModule;
