-- delete from complaint
-- where com='light fix'

--  drop table complaint

SELECT * FROM complaint order by solved

-- insert into complaint (rollno,com) values ('20011P0511','Fan repair')

-- create table complaint(
-- 	id serial,
-- 	rollno char(10) references student(rollno),
-- 	com text,
-- 	solved text default 'Not Solved'
-- )

alter table complaint
add unique (rollno)
 -- alter column solved default 'Not Solved'
-- add solved char(10);
-- alter table student
-- add unique rollno