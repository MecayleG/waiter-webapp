drop table if exists waiters_info;

create table waiters_info(
    id serial not null primary key,
     names text not null
);
create table weekdays(
    id serial not null primary key,
     days text
);
create table all_info(
    id serial not null primary key,
     names_id int,
     days_id int,
    foreign key (names_id) references waiters_info(id),
    foreign key (days_id) references weekdays(id)
);