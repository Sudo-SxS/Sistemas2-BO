// BackEnd/src/Controller/PlanController.ts
// ============================================
import { logger } from "../Utils/logger.ts";
import { PlanCreate, PlanUpdate } from "../schemas/venta/Plan.ts";
import { PlanService } from "../services/PlanService.ts";

export class PlanController {
  private planService: PlanService;

  constructor(planService: PlanService) {
    this.planService = planService;
  }

  async getAll(input: { page?: number; limit?: number }) {
    try {
      const plans = await this.planService.getAll(input);
      return plans;
    } catch (error) {
      logger.error("PlanController.getAll:", error);
      throw error;
    }
  }

  async getById(input: { id: string }) {
    try {
      const plan = await this.planService.getById(input.id);
      return plan;
    } catch (error) {
      logger.error("PlanController.getById:", error);
      throw error;
    }
  }

  async create(input: { plan: PlanCreate }) {
    try {
      const newPlan = await this.planService.create(input.plan);
      return newPlan;
    } catch (error) {
      logger.error("PlanController.create:", error);
      throw error;
    }
  }

  async update(input: { id: string; plan: PlanUpdate }) {
    try {
      const updatedPlan = await this.planService.update(input.id, input.plan);
      return updatedPlan;
    } catch (error) {
      logger.error("PlanController.update:", error);
      throw error;
    }
  }

  async delete(input: { id: string }) {
    try {
      const deleted = await this.planService.delete(input.id);
      return deleted;
    } catch (error) {
      logger.error("PlanController.delete:", error);
      throw error;
    }
  }

  async getByEmpresa(input: { empresa: string }) {
    try {
      const plans = await this.planService.getByEmpresa({ empresa: Number(input.empresa) });
      return plans;
    } catch (error) {
      logger.error("PlanController.getByEmpresa:", error);
      throw error;
    }
  }
}