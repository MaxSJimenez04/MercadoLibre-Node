using System.Net.Http.Json;
using frontendnet.Models;

namespace frontendnet.Services;

public class CarritosClientService(HttpClient client)
{
    public async Task<List<Carrito>?> GetHistorialAsync(string email)
    {
        return await client.GetFromJsonAsync<List<Carrito>>($"api/carritos/historial/{email}");
    }

    public async Task<Carrito?> GetActualAsync(string email)
    {
        return await client.GetFromJsonAsync<Carrito>($"api/carritos/actual/{email}");
    }

    public async Task PostAsync(Carrito carrito)
    {
        var response = await client.PostAsJsonAsync("api/carritos", carrito);
        response.EnsureSuccessStatusCode();
    }

    public async Task ComprarAsync(string idCarrito, Carrito carrito)
    {
        var response = await client.PutAsJsonAsync($"api/carritos/comprar/{idCarrito}", carrito);
        response.EnsureSuccessStatusCode();
    }

    public async Task AgregarProductoAsync(string idCarrito, ProductoCarrito producto)
    {
        var response = await client.PostAsJsonAsync($"api/carritos/{idCarrito}/productos", producto);
        response.EnsureSuccessStatusCode();
    }

    public async Task ModificarCantidadAsync(string idCarrito, int idProducto, ProductoCarrito producto)
    {
        var response = await client.PutAsJsonAsync($"api/carritos/{idCarrito}/productos/{idProducto}", producto);
        response.EnsureSuccessStatusCode();
    }

    public async Task QuitarProductoAsync(string idCarrito, int idProducto)
    {
        var response = await client.DeleteAsync($"api/carritos/{idCarrito}/productos/{idProducto}");
        response.EnsureSuccessStatusCode();
    }
}
