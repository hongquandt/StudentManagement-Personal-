using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class User
{
    public int UserId { get; set; }

    public string Username { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? Email { get; set; }

    public int RoleId { get; set; }

    public string? AvatarUrl { get; set; }

    public string? CitizenIdImage { get; set; }

    public string? Ethnicity { get; set; }

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Parent? Parent { get; set; }

    public virtual Role Role { get; set; } = null!;

    public virtual Student? Student { get; set; }

    public virtual Teacher? Teacher { get; set; }
}
