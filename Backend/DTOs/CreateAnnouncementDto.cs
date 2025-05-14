namespace Backend.DTOs;
public class CreateAnnouncementDto
{
    public string Message { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}