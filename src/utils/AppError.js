// Uso: throw new AppError(404, "Producto no encontrado");
export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
