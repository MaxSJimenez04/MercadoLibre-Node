using System.Security.Claims;
using frontendnet.Models;
using frontendnet.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace frontendnet;

[Authorize(Roles = "Usuario")]
public class CarritoController(CarritosClientService carrito, IConfiguration configuration) : Controller
{
    private string GetUserEmail()
    {
        return User.FindFirstValue(ClaimTypes.Name) ?? "";
    }

    public async Task<IActionResult> Index()
    {
        ViewBag.Url = configuration["UrlWebAPI"];
        string email = GetUserEmail();
        if (string.IsNullOrEmpty(email))
            return RedirectToAction("Home", "AccessDenied");

        Carrito? carritoActual = null;
        try
        {
            carritoActual = await carrito.GetActualAsync(email);
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");

            ViewBag.Error = "No se pudo obtener el carrito. Intenta más tarde.";
            return View(new Carrito {Email = email, ItemsCarrito = new List<ProductoCarrito>(), Total = 0, Actual = true });
        }

        if (carritoActual == null)
            carritoActual = new Carrito {Email = email, ItemsCarrito = new List<ProductoCarrito>(), Total = 0, Actual = true };

        return View(carritoActual);
    }

    [HttpPost]
    public async Task<IActionResult> Agregar(int IdProducto, int Cantidad)
    {
        var email = User.FindFirstValue(ClaimTypes.Name);
        if (string.IsNullOrEmpty(email))
            return RedirectToAction("Salir", "Auth");

        try
        {

            var carritoActual = await carrito.GetActualAsync(email);
            if (carritoActual == null)
                return RedirectToAction("Detalle", "Productos", new {id = IdProducto});


            var producto = new ProductoCarrito
            {
                IdCarrito = carritoActual.Id!,
                IdProducto = IdProducto,
                Cantidad = Cantidad
            };

            await carrito.AgregarProductoAsync(carritoActual.Id!, producto);
            return RedirectToAction("Detalle", "Productos", new {id = IdProducto});
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");

            if (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                return RedirectToAction("Error", "Home");
        }

        return RedirectToAction("Detalle", "Productos", new {id = IdProducto});
    }

    [HttpPost]
    public async Task<IActionResult> ModificarCantidad(string IdCarrito, int IdProducto, int Cantidad)
    {
        if (Cantidad < 1)
        {
            ModelState.AddModelError("", "La cantidad debe ser al menos 1.");
            return RedirectToAction(nameof(Index));
        }

        var producto = new ProductoCarrito
        {
            IdCarrito = IdCarrito,
            IdProducto = IdProducto,
            Cantidad = Cantidad
        };

        try
        {
            await carrito.ModificarCantidadAsync(IdCarrito, IdProducto, producto);
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");
        }

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> EliminarProducto(string IdCarrito, int IdProducto)
    {
        try
        {
            await carrito.QuitarProductoAsync(IdCarrito, IdProducto);
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");
        }

        return RedirectToAction(nameof(Index));
    }

    [HttpPost]
    public async Task<IActionResult> Comprar(string IdCarrito)
    {
        var email = GetUserEmail();
        if (string.IsNullOrEmpty(email))
            return RedirectToAction("Salir", "Auth");

        try
        {
            var carritoActual = await carrito.GetActualAsync(email);
            if (carritoActual is null || carritoActual.Id != IdCarrito)
                return NotFound();

            carritoActual.Actual = false;
            carritoActual.FechaCompra = DateTime.Now;
            carritoActual.Email = email;

            await carrito.ComprarAsync(IdCarrito, carritoActual);
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");
        }

        return RedirectToAction(nameof(Index));
    }
}
