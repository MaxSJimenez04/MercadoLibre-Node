using System.ComponentModel.DataAnnotations;

namespace frontendnet.Models;

public class Carrito
{
    [Display(Name = "Id")]
    public string? Id { get; set; }

    public string? UsuarioId { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    [Display(Name = "Carrito Actual")]
    public bool Actual { get; set; }

    [Required(ErrorMessage = "El campo {0} es obligatorio.")]
    public decimal Total { get; set; }

    public DateTime? FechaCompra { get; set; }

    public List<ProductoCarrito>? ItemsCarrito { get; set; }
}
