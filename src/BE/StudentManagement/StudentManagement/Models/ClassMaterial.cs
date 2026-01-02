using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class ClassMaterial
{
    public int MaterialId { get; set; }

    public int ClassId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string? FilePath { get; set; }

    public DateTime UploadDate { get; set; }

    public virtual Class Class { get; set; } = null!;
}
