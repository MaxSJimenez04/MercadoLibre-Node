using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace frontendnet.Models;

public class Carrito
{
    [Display(Name = "Id")]
    public string? Id { get; set; }

    [JsonPropertyName("idusuario")]
    public string? UsuarioId { get; set; }

    public string? Email { get; set; } 

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [Display(Name = "Carrito Actual")]
    public bool Actual { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    public decimal Total { get; set; }

    [JsonPropertyName("fechacompra")]
    public DateTime? FechaCompra { get; set; }

    public List<ProductoCarrito>? ItemsCarrito { get; set; }
}
