using System.Security.Claims;
using frontendnet.Models;
using frontendnet.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace frontendnet;

public class RegistroUsuariosController(UsuariosClientService usuario) : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Crear(UsuarioPwd itemToCreate)
    {
        itemToCreate.Rol = "Usuario";
        if (ModelState.IsValid)
        {
            try
            {
                await usuario.PostAsync(itemToCreate);
                return RedirectToAction("Login", "Auth");
            }
            catch (HttpRequestException ex)
            {
                if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                    return RedirectToAction("Salir", "Auth");

                // ⚠️ Mostrar mensaje real del error HTTP
                ModelState.AddModelError("", $"Error de red: {ex.Message}");
            }
            catch (Exception ex)
            {
                // ⚠️ Mostrar cualquier otro error
                ModelState.AddModelError("", $"Error inesperado: {ex.Message}");
            }
        }
        else
        {
            ModelState.AddModelError("", "El modelo no es válido.");
        }
        
        return View("Index", itemToCreate);
    }
        
}
