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

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Crear(UsuarioPwd itemToCreate)
    {
        itemToCreate.Rol = "Usuario";

        ModelState.Remove(nameof(itemToCreate.Rol));

        if (ModelState.IsValid)
        {
            try
            {
                await usuario.PostAsync(itemToCreate);
                ViewBag.MensajeModal = "¡Registro de cuenta exitoso!";
                return RedirectToAction("Login", "Auth");
            }
            catch (HttpRequestException ex)
            {
                if (ex.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                    Console.WriteLine(ex);
                
                Console.WriteLine($"HttpRequestException: {ex.Message}");
                ModelState.AddModelError("", $"Error de red: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception: {ex.Message}");
                ModelState.AddModelError("", $"Error inesperado: {ex.Message}");
                ViewBag.MensajeModal = "Registro NO exitoso. Inténtelo nuevamente.";
            }
        }
        else
        {
            ModelState.AddModelError("", "El modelo no es válido.");
        }

        return View("Index", itemToCreate);
    }  
}