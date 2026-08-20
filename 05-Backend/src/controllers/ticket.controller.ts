import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import fs from "fs";
import path from "path";

const ticketsPath = path.join(__dirname, "../../data/tickets.json");

export async function getTickets(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!fs.existsSync(ticketsPath)) {
      res.status(200).json({ success: true, data: [] });
      return;
    }
    const data = JSON.parse(fs.readFileSync(ticketsPath, "utf-8"));
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateTicket(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, reply } = req.body;
    
    if (!fs.existsSync(ticketsPath)) {
      res.status(404).json({ success: false, message: "No tickets found" });
      return;
    }
    
    let tickets = JSON.parse(fs.readFileSync(ticketsPath, "utf-8"));
    const ticketIdx = tickets.findIndex((t: any) => t.id.toString() === id);
    
    if (ticketIdx === -1) {
      res.status(404).json({ success: false, message: "Ticket not found" });
      return;
    }
    
    if (status) tickets[ticketIdx].status = status;
    if (reply) tickets[ticketIdx].reply = reply; // Store reply mock
    
    fs.writeFileSync(ticketsPath, JSON.stringify(tickets, null, 2));
    res.status(200).json({ success: true, data: tickets[ticketIdx] });
  } catch (error) {
    next(error);
  }
}
