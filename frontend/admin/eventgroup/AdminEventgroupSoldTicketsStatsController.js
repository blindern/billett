angular.module('billett.admin').controller('AdminEventgroupSoldTicketsStatsController', function (Page, $routeParams, AdminEventgroup) {
    var self = this;
    Page.setTitle('Billettstatistikk for arrangementgruppe');

    var loader = Page.setLoading();
    AdminEventgroup.getSoldTicketsStats($routeParams['id']).success(function (ret) {
        loader();

        var accum = function () {
            var self = this;
            this.parents = [];
            this.count = 0;
            this.revoked = 0;
            this.price = 0;
            this.fee = 0;
            this.add = function (count, revoked, price, fee) {
                self.count += count;
                self.revoked += revoked;
                self.price += price * (count - revoked);
                self.fee += fee * (count - revoked);
                self.parents.forEach(function (parent) { parent.add(count, revoked, price, fee); });
                return self;
            };
            this.parent = function (parent) {
                self.parents.push(parent);
                return self;
            };
        };

        self.topAccum = new accum;
        self.daysAccum = {};

        self.days = ret.tickets.reduce(function (prev, cur) {
            if (prev.indexOf(cur.day) == -1) {
                prev.push(cur.day);
                self.daysAccum[cur.day] = new accum;
            }
            return prev;
        }, []).sort();

        var events = {};
        self.events = [];
        ret.events.forEach(function (event) {
            event.ticketgroups = [];
            event.accum = (new accum).parent(self.topAccum);
            event.daysAccum = self.days.reduce(function (prev, cur) {
                prev[cur] = new accum;
                return prev;
            }, {});
            events[event.id] = event;
            self.events.push(event);
        });

        var ticketgroups = {};
        ret.ticketgroups.forEach(function (ticketgroup) {
            ticketgroup.days = {};
            ticketgroup.accum = (new accum).parent(events[ticketgroup.event_id].accum);
            self.days.forEach(function (day) {
                ticketgroup.days[day] = null;
            });
            events[ticketgroup.event_id].ticketgroups.push(ticketgroup);
            ticketgroups[ticketgroup.id] = ticketgroup;
        });

        ret.tickets.forEach(function (ticket) {
            var ticketgroup = ticketgroups[ticket.ticketgroup_id];
            var event = events[ticket.event_id];
            ticketgroup.days[ticket.day] = ticket;
            ticket.accum = (new accum)
                .parent(ticketgroup.accum)
                .parent(self.daysAccum[ticket.day])
                .parent(event.daysAccum[ticket.day])
                .add(ticket.num_tickets, ticket.num_revoked, ticketgroup.price, ticketgroup.fee);
        });
    });
});
