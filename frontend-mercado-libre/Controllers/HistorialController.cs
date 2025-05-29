using System.Security.Claims;
using frontendnet.Models;
using frontendnet.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace frontendnet.Controllers;

[Authorize(Roles = "Usuario")]
public class HistorialController(CarritosClientService _carritosService) : Controller
{
    public async Task<IActionResult> Index()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email is null)
            return RedirectToAction("Salir", "Auth");

        List<Carrito>? historial = [];
        try
        {
            var carritos = await _carritosService.GetHistorialAsync(email);
            historial = carritos?.Where(c => c.Actual == false).ToList() ?? [];
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");
        }

        return View(historial);
    }

    public async Task<IActionResult> Detalle(string id)
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (email is null)
            return RedirectToAction("Salir", "Auth");

        Carrito? carrito = null;
        try
        {
            carrito = await _carritosService.GetActualAsync(email);
            carrito = carrito?.Id == id ? carrito : (await _carritosService.GetHistorialAsync(email))?.FirstOrDefault(c => c.Id == id);
            if (carrito is null) return NotFound();
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");
        }

        ViewData["EsHistorial"] = true;
        return View("~/Views/Carrito/Index.cshtml", carrito);

    }
}
