import type { FeedItem, AzureService, ServiceStatus } from "@/types";
import type { FeedFetcher, StatusService } from "./interfaces";

const AZURE_REGIONS = [
  "East US", "East US 2", "West US", "West US 2", "West US 3",
  "Central US", "North Central US", "South Central US", "West Central US",
  "Canada Central", "Canada East",
  "Brazil South", "Brazil Southeast",
  "North Europe", "West Europe", "UK South", "UK West",
  "France Central", "France South",
  "Germany West Central", "Germany North",
  "Switzerland North", "Switzerland West",
  "Norway East", "Norway West",
  "Sweden Central",
  "East Asia", "Southeast Asia",
  "Japan East", "Japan West",
  "Australia East", "Australia Southeast", "Australia Central",
  "Central India", "South India", "West India",
  "Korea Central", "Korea South",
  "South Africa North", "South Africa West",
  "UAE North", "UAE Central",
  "Qatar Central",
  "Poland Central",
  "Israel Central",
  "Italy North",
  "Spain Central",
];

const AZURE_SERVICE_CATEGORIES: Record<string, string[]> = {
  Compute: ["Virtual Machines", "App Service", "Azure Functions", "Azure Kubernetes Service", "Container Instances", "Batch"],
  Networking: ["Virtual Network", "Load Balancer", "Application Gateway", "Azure DNS", "Traffic Manager", "ExpressRoute", "VPN Gateway", "Azure Firewall", "Azure Front Door"],
  Storage: ["Storage Accounts", "Blob Storage", "Azure Files", "Queue Storage", "Table Storage", "Disk Storage", "Azure Data Lake Storage"],
  Databases: ["Azure SQL Database", "Cosmos DB", "Azure Database for PostgreSQL", "Azure Database for MySQL", "Azure Cache for Redis", "Azure Database for MariaDB"],
  "AI + Machine Learning": ["Azure OpenAI", "Azure AI Services", "Azure Machine Learning", "Azure Bot Service", "Azure Cognitive Search"],
  Analytics: ["Azure Synapse Analytics", "Azure Data Factory", "Azure Databricks", "HDInsight", "Azure Stream Analytics", "Event Hubs"],
  "Integration": ["Azure Service Bus", "API Management", "Logic Apps", "Event Grid"],
  "Security": ["Azure Active Directory", "Key Vault", "Azure Sentinel", "Azure DDoS Protection", "Microsoft Defender for Cloud"],
  "Developer Tools": ["Azure DevOps", "Visual Studio App Center", "Azure Monitor", "Application Insights"],
  "Management": ["Azure Resource Manager", "Azure Policy", "Azure Advisor", "Cost Management"],
};

export class AzureStatusService implements StatusService {
  private feedFetcher: FeedFetcher;

  constructor(feedFetcher: FeedFetcher) {
    this.feedFetcher = feedFetcher;
  }

  async fetchServices(): Promise<AzureService[]> {
    const items = await this.feedFetcher.fetch(
      "https://azure.status.microsoft/en-us/status/feed/",
    );

    if (items.length === 0) {
      return this.buildDefaultServiceList();
    }

    return this.mapFeedItemsToServices(items);
  }

  private mapFeedItemsToServices(items: FeedItem[]): AzureService[] {
    const serviceMap = new Map<string, AzureService>();

    for (const item of items) {
      const status = this.inferStatus(item);
      const category = this.inferCategory(item);
      const affectedServices = this.extractAffectedServices(item);

      if (affectedServices.length > 0) {
        for (const serviceName of affectedServices) {
          const existing = serviceMap.get(serviceName);
          if (!existing || this.isWorseThan(status, existing.status)) {
            serviceMap.set(serviceName, {
              name: serviceName,
              status,
              category: this.getCategoryForService(serviceName) || category,
              description: item.title,
              lastUpdated: item.pubDate,
            });
          }
        }
      } else {
        const name = item.title.split(" - ")[0]?.trim() ?? item.title;
        if (name) {
          serviceMap.set(name, {
            name,
            status,
            category,
            description: item.title,
            lastUpdated: item.pubDate,
          });
        }
      }
    }

    const defaults = this.buildDefaultServiceList();
    for (const svc of defaults) {
      if (!serviceMap.has(svc.name)) {
        serviceMap.set(svc.name, svc);
      }
    }

    return Array.from(serviceMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }

  private extractAffectedServices(item: FeedItem): string[] {
    const services: string[] = [];
    const allServices = Object.values(AZURE_SERVICE_CATEGORIES).flat();

    for (const service of allServices) {
      if (
        item.title.toLowerCase().includes(service.toLowerCase()) ||
        item.description.toLowerCase().includes(service.toLowerCase())
      ) {
        services.push(service);
      }
    }

    for (const cat of item.categories) {
      const match = allServices.find(
        (s) => s.toLowerCase() === cat.toLowerCase(),
      );
      if (match) services.push(match);
    }

    return [...new Set(services)];
  }

  private getCategoryForService(serviceName: string): string | undefined {
    for (const [category, services] of Object.entries(AZURE_SERVICE_CATEGORIES)) {
      if (services.includes(serviceName)) return category;
    }
    return undefined;
  }

  private inferStatus(item: FeedItem): ServiceStatus {
    const text = `${item.title} ${item.description}`.toLowerCase();
    if (
      text.includes("resolved") ||
      text.includes("mitigated") ||
      text.includes("recovered")
    ) {
      return "good";
    }
    if (
      text.includes("outage") ||
      text.includes("degraded") ||
      text.includes("major")
    ) {
      return "critical";
    }
    if (
      text.includes("investigating") ||
      text.includes("advisory") ||
      text.includes("intermittent")
    ) {
      return "warning";
    }
    return "warning";
  }

  private inferCategory(item: FeedItem): string {
    if (item.categories.length > 0) return item.categories[0] ?? "General";
    return "General";
  }

  private isWorseThan(a: ServiceStatus, b: ServiceStatus): boolean {
    const severity: Record<ServiceStatus, number> = {
      good: 0,
      unknown: 1,
      warning: 2,
      critical: 3,
    };
    return severity[a] > severity[b];
  }

  private buildDefaultServiceList(): AzureService[] {
    const services: AzureService[] = [];
    const now = new Date().toISOString();

    for (const [category, serviceNames] of Object.entries(AZURE_SERVICE_CATEGORIES)) {
      for (const name of serviceNames) {
        services.push({
          name,
          status: "good",
          category,
          description: "No issues reported",
          lastUpdated: now,
        });
      }
    }

    return services;
  }
}

export { AZURE_REGIONS, AZURE_SERVICE_CATEGORIES };
