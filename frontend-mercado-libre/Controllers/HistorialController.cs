using System.Security.Claims;
using frontendnet.Models;
using frontendnet.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace frontendnet.Controllers;

[Authorize(Roles = "Usuario")]
public class HistorialController(CarritosClientService _carritosService, IConfiguration configuration) : Controller
{
    public async Task<IActionResult> Index()
    {
        var email = User.FindFirstValue(ClaimTypes.Name);
        if (email == null)
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
        ViewBag.Url = configuration["UrlWebAPI"];
        Carrito? carrito = null;
        try
        {
            carrito = await _carritosService.GetDetalleAsync(id);
            if (carrito is null) return NotFound();
        }
        catch (HttpRequestException ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                return RedirectToAction("Salir", "Auth");
            
        }

        ViewData["EsHistorial"] = true;
        return View("Detalle", carrito);

    }
}
