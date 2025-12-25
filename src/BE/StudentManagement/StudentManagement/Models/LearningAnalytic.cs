using System;
using System.Collections.Generic;

namespace StudentManagement.Models;

public partial class LearningAnalytic
{
    public int AnalyticsId { get; set; }

    public int StudentId { get; set; }

    public int SemesterId { get; set; }

    public string? RiskLevel { get; set; }

    public double? PredictedAverage { get; set; }

    public string? Recommendation { get; set; }

    public virtual Semester Semester { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
