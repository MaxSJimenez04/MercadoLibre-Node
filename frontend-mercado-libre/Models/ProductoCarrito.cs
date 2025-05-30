using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace frontendnet.Models;

public class ProductoCarrito
{
    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [JsonPropertyName("idcarrito")]
    public required string IdCarrito { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [JsonPropertyName("idproducto")]
    public required int IdProducto { get; set; }

    public int? Cantidad { get; set; }

    public decimal? Subtotal { get; set; }

     public Producto? Producto { get; set; }
}
